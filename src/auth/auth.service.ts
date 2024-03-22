import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserResponse, RegisterDto, UpdateUserDto, UserFilterType, UserPaginationResponseType } from './dtos/auth.dto';
import { User } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService,
        private jwtService: JwtService) { }

    create = async (userData: RegisterDto): Promise<CreateUserResponse> => {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: userData.email
            }
        });
        if (user) {
            throw new HttpException({ message: 'email' }, HttpStatus.BAD_REQUEST);
        }
        const hashPassword = await hash(userData.password, 10);
        try {
            const res = await this.prismaService.user.create({
                data: {
                    ...userData,
                    password: hashPassword
                }
            });
            return { message: 'success', user: res };
        } catch (error) {
            throw new HttpException({ message: 'error' }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    login = async (data: { email: string, password: string }): Promise<any> => {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: data.email
            }
        })
        if (!user) {
            throw new HttpException({ message: "Account" }, HttpStatus.UNAUTHORIZED)
        }
        const verify = await compare(data.password, user.password)
        if (!verify) {
            throw new HttpException({ message: "Incorrect" }, HttpStatus.UNAUTHORIZED)
        }
        const payload = { id: user.id, name: user.name, email: user.email }
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.ACCESS_TOKEN_KEY || 'defaultAccessTokenSecret',
            expiresIn: '1h'
        })
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.REFRESH_TOKEN_KEY || 'defaultAccessTokenSecret',
            expiresIn: '100d'
        })
        return {
            accessToken,
            refreshToken,
            message: "success"
        }
    }

    async getAll(filters: UserFilterType): Promise<UserPaginationResponseType> {
        const items_per_page = Number(filters.items_per_page) || 10
        const page = Number(filters.page) || 1
        const search = filters.search || ''
        const skip = page > 1 ? (page - 1) * items_per_page : 0
        const users = await this.prismaService.user.findMany({
            take: items_per_page,
            skip,
            where: {
                OR: [
                    {
                        name: {
                            contains: search
                        }
                    },
                    {
                        email: {
                            contains: search
                        }
                    }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const total = await this.prismaService.user.count({
            where: {
                OR: [
                    {
                        name: {
                            contains: search
                        }
                    },
                    {
                        email: {
                            contains: search
                        }
                    }
                ]
            }
        })
        return {
            data: users,
            total,
            currentPage: page,
            itemsPerPage: items_per_page
        }
    }

    async getDetail(id: number): Promise<User> {
        return this.prismaService.user.findFirst({
            where: {
                id
            }
        })
    }

    async update(id: number, data: UpdateUserDto): Promise<User> {
        try {
            const existingUser = await this.prismaService.user.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw new Error(`Không có người dùng nào có id là: ${id}`);
            }
            const updatedUser = await this.prismaService.user.update({
                where: { id },
                data,
            });
            return updatedUser;
        } catch (error) {
            console.error("Lỗi khi cập nhật người dùng:", error);
            throw error;
        }
    }

    async delete(id: number): Promise<{ message: string }> {
        try {
            const existingUser = await this.prismaService.user.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw new HttpException(
                    { message: `Không tìm thấy người dùng có id ${id}` },
                    HttpStatus.NOT_FOUND
                );
            }
            await this.prismaService.user.delete({
                where: { id },
            });
            return { message: 'XÓa người dùng thành công !' };
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            throw new HttpException(
                { message: "Lỗi khi xóa người dùng" },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


}



