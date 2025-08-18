import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user/user';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async findByEmailOrUsername(email: string, username: string) {
    return this.repo.findOne({
      where: [{ email }, { username }],
    });
  }

  async findByIdentifier(identifier: string) {
    return this.repo.findOne({
      where: [{ username: identifier }, { email: identifier }],
    });
  }

  async findById(userId: string) {
    return this.repo.findOne({
      where: { id: userId }
    });
  }

  async updateBalance(userId: string, newBalance: number) {
    await this.repo.update(userId, { balance: newBalance });
    return this.repo.findOne({ where: { id: userId } });
  }

  // New methods for user CRUD
  async findAll(page: number = 1, limit: number = 15, search?: string) {
    if (limit > 50) limit = 50;
    const skip = (page - 1) * limit;

    const query = this.repo.createQueryBuilder('user')
      .select(['user.id', 'user.username', 'user.email', 'user.first_name', 'user.last_name', 'user.balance']);

    if (search) {
      query.where(
        '(user.username LIKE :search OR user.first_name LIKE :search OR user.last_name LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [users, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: total
      }
    };
  }

  async findByIdWithStats(userId: string) {
    const user = await this.repo.createQueryBuilder('user')
      .select(['user.id', 'user.username', 'user.email', 'user.first_name', 'user.last_name', 'user.balance'])
      .leftJoin('user.userCourses', 'userCourse')
      .addSelect('COUNT(userCourse.id)', 'courses_purchased')
      .where('user.id = :userId', { userId })
      .groupBy('user.id')
      .getRawOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.user_id,
      username: user.user_username,
      email: user.user_email,
      first_name: user.user_first_name,
      last_name: user.user_last_name,
      balance: user.user_balance,
      courses_purchased: parseInt(user.courses_purchased) || 0
    };
  }

  async incrementBalance(userId: string, increment: number) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newBalance = user.balance + increment;
    await this.repo.update(userId, { balance: newBalance });
    
    return this.repo.findOne({ 
      where: { id: userId },
      select: ['id', 'username', 'balance']
    });
  }

  async update(userId: string, updateData: { email?: string; username?: string; first_name?: string; last_name?: string; password?: string }) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_admin) {
      throw new BadRequestException('Cannot modify admin user');
    }

    // Check if username or email already exists (excluding current user)
    if (updateData.username) {
      const existingUser = await this.repo.findOne({ 
        where: { username: updateData.username }
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Username already exists');
      }
    }

    if (updateData.email) {
      const existingUser = await this.repo.findOne({ 
        where: { email: updateData.email }
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.repo.update(userId, updateData);
    
    return this.repo.findOne({ 
      where: { id: userId },
      select: ['id', 'username', 'first_name', 'last_name', 'balance']
    });
  }

  async delete(userId: string) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_admin) {
      throw new BadRequestException('Cannot delete admin user');
    }

    await this.repo.delete(userId);
  }

}


