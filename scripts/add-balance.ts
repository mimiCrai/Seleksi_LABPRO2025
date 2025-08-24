import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';

async function addBalance() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  try {
    // Get username from command line argument
    const username = process.argv[2];
    const amount = parseInt(process.argv[3]) || 1000;

    if (!username) {
      console.log('Usage: npx ts-node src/scripts/add-balance.ts <username> [amount]');
      await app.close();
      return;
    }

    // Find user by username
    const user = await userService.findByIdentifier(username);
    
    if (!user) {
      console.log(`User '${username}' not found!`);
      await app.close();
      return;
    }

    // Add balance
    const newBalance = user.balance + amount;
    await userService.updateBalance(user.id, newBalance);

    console.log(`Added $${amount} to ${user.username}'s account`);
    console.log(`New balance: $${newBalance}`);
    
  } catch (error) {
    console.error('Error adding balance:', error);
  }

  await app.close();
}

addBalance();
