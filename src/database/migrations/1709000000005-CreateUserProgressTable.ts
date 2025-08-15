import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUserProgressTable1709000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_progress',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'UUID()',
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'moduleId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'completed_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'user_progress',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_progress',
      new TableForeignKey({
        columnNames: ['moduleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'course_module',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_progress');
  }
}
