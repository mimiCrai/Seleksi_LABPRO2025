import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCourseModuleTable1709000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'course_module',
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
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'pdf_content',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'video_content',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'courseId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'order',
            type: 'int',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'course_module',
      new TableForeignKey({
        columnNames: ['courseId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'course',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add unique constraint for course + order
    await queryRunner.createIndex(
      'course_module',
      new TableIndex({
        name: 'IDX_course_module_order_unique',
        columnNames: ['courseId', 'order'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('course_module');
  }
}
