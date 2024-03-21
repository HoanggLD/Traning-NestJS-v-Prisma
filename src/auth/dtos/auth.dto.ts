import { Post, User } from "@prisma/client"
import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from "class-validator"


export class RegisterDto {
    @IsNotEmpty()
    name: string

    @Matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    phone: string

    @IsEmail()
    email: string

    @MinLength(6)
    password: string

    status: number;
}

export class LoginDto {
    @IsEmail()
    email: string

    @IsNotEmpty()
    @MinLength(6)
    password: string
}
export class UpdateUserDto {
    @IsEmail()
    email: string

    name: string

    @IsOptional()
    @Matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    phone: string

    @MinLength(6)
    password: string

    status: number
}

export interface UserFilterType {
    items_per_page?: number
    page?: number
    search?: string
}

export interface UserPaginationResponseType {
    data: User[]
    total: number
    currentPage: number
    itemsPerPage: number
}

// post
export class CreatePostDto {
    @IsNotEmpty()
    title: string

    @IsNotEmpty()
    summary: string

    @IsNotEmpty()
    content: string
    status: number

    @IsNotEmpty()
    ownerId: number

}

export class UpdatePostDto {
    title: string
    summary: string
    content: string
    status: number
    ownerId: number
}

export interface PostFilterType {
    items_per_page?: number
    page?: number
    search?: string
}

export interface PostPaginationResponseType {
    data: Post[]
    total: number
    currentPage: number
    itemsPerPage: number
}

export interface CreateUserResponse {
    message: string;
    user?: User;
}