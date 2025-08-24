import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ModuleOrderItem {
  @ApiProperty({
    description: 'Module ID',
    example: 'b5fb1a10-a67f-47cb-9782-b0911adfdfee'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'New order position',
    example: 1
  })
  @IsNumber()
  order: number;
}

export class ReorderModulesDto {
  @ApiProperty({
    description: 'Array of modules with new order',
    type: [ModuleOrderItem]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleOrderItem)
  modules: ModuleOrderItem[];
}
