import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePostDto, PostFilterType, PostPaginationResponseType, UpdatePostDto } from './dto/post.dto';
import { Post } from '@prisma/client';

@Injectable()
export class PostService {
    constructor(private prismaService: PrismaService) { }

    async create(data: CreatePostDto): Promise<Post> {
        return await this.prismaService.post.create({
            data: data,
        });
    }

    async getAll(filters: PostFilterType): Promise<PostPaginationResponseType> {
        const items_per_page = Number(filters.items_per_page) || 10
        const page = Number(filters.page) || 1
        const search = filters.search || ''
        const skip = page > 1 ? (page - 1) * items_per_page : 0
        const posts = await this.prismaService.post.findMany({
            take: items_per_page,
            skip,
            where: {
                OR: [
                    {
                        title: {
                            contains: search
                        }
                    },
                    {
                        summary: {
                            contains: search
                        }
                    },
                    {
                        content: {
                            contains: search
                        }
                    }
                ]
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })

        const total = await this.prismaService.post.count({
            where: {
                OR: [
                    {
                        title: {
                            contains: search
                        }
                    },
                    {
                        summary: {
                            contains: search
                        }
                    },
                    {
                        content: {
                            contains: search
                        }
                    }
                ]
            }
        })

        return {
            data: posts,
            total,
            currentPage: page,
            itemsPerPage: items_per_page
        }
    }

    async getDetail(id: number): Promise<Post> {
        return await this.prismaService.post.findFirst({
            where: {
                id
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })
    }

    async update(id: number, data: UpdatePostDto): Promise<Post> {
        const { ownerId, owner, ...postData } = data;
    
        const updatedPost = await this.prismaService.post.update({
            where: {
                id,
            },
            data: {
                ...postData,
                owner: {
                    connect: { id: ownerId },
                    update: owner
                }
                
            }
        });
    
        return updatedPost;
    }
    
    
    

    async delete(id: number): Promise<Post> {
        const postToDelete = await this.prismaService.post.findUnique({
            where: {
                id,
            },
        });
    
        if (!postToDelete) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }
    
        const deletedPost = await this.prismaService.post.delete({
            where: {
                id,
            },
        });
    
        console.log(`Post with ID ${id} has been successfully deleted`);
        console.log('Deleted Post:', deletedPost);
        
    
        return deletedPost;
}
}


