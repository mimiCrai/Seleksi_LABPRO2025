import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user/user';

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

}


