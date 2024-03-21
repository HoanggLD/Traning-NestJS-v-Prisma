import { Controller, Post, Body, Get, Query, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { User } from '@prisma/client'
import { AuthService } from './auth.service';
import {  CreateUserResponse, LoginDto, RegisterDto, UpdateUserDto, UserFilterType, UserPaginationResponseType } from './dtos/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // @Post('register')
    // create(@Body() body: RegisterDto): Promise<User> {
    //     return this.authService.create(body)
    // }

    @Post('register')
    async create(@Body() body: RegisterDto): Promise<CreateUserResponse> {
        return this.authService.create(body);
    }


    @Get()
    getAll(@Query() params: UserFilterType): Promise<UserPaginationResponseType> {
        console.log("get all user api", params)
        return this.authService.getAll(params)
    }

    @Get(':id')
    getDetail(@Param('id', ParseIntPipe) id: number): Promise<User> {
        console.log("get detail user api=> ", id)
        return this.authService.getDetail(id)
    }

    @Post('login')
    login(@Body() body: LoginDto): Promise<any> {
        return this.authService.login(body)
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUserDto): Promise<User> {
        console.log("update user api=> ", id)
        return this.authService.update(id, data)
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        console.log("delete user api=> ", id)
        const result = await this.authService.delete(id);
        return result;
    }
    

}
