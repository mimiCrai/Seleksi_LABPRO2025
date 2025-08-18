import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CookieAuthGuard } from '../auth/cookie-auth.guard';
import { CourseService } from '../course/course.service';
import { UserService } from '../user/user.service';
import type { Response } from 'express';

@Controller('certificates')
@ApiTags('Certificates')
export class CertificateController {
  constructor(
    private courseService: CourseService,
    private userService: UserService,
  ) {}

  @Get(':userId/:courseId')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Download certificate for completed course' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiParam({ name: 'courseId', type: String, description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Certificate downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  @ApiResponse({ status: 400, description: 'Course not completed' })
  async downloadCertificate(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    try {
      // Get user and course information
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const courseResult = await this.courseService.findById(courseId);
      if (courseResult.status !== 'success' || !courseResult.data) {
        throw new NotFoundException('Course not found');
      }

      const course = courseResult.data;

      // Check if user has completed the course
      const progressSummary = await this.courseService.getCourseProgressSummary(courseId, userId);
      if (!progressSummary.is_completed) {
        return res.status(400).json({
          status: 'error',
          message: 'Course must be 100% completed to download certificate',
        });
      }

      // Generate certificate HTML
      const certificateHtml = this.generateCertificateHtml(user, course, progressSummary);

      // Set response headers for download
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `inline; filename="certificate-${course.title.replace(/[^a-zA-Z0-9]/g, '_')}.html"`);

      return res.send(certificateHtml);
    } catch (error) {
      console.error('Error generating certificate:', error.message);
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found or course not completed',
      });
    }
  }

  private generateCertificateHtml(user: any, course: any, progressSummary: any): string {
    const completionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Completion - ${course.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .certificate {
            background: #ffffff;
            width: 800px;
            max-width: 90vw;
            padding: 60px 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 8px solid #f0f0f0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .certificate::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #667eea, #764ba2, #667eea);
            z-index: -1;
            border-radius: 20px;
        }

        .certificate-header {
            margin-bottom: 30px;
        }

        .certificate-title {
            font-size: 2.5rem;
            color: #2c3e50;
            margin-bottom: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 3px;
        }

        .certificate-subtitle {
            font-size: 1.2rem;
            color: #7f8c8d;
            font-style: italic;
        }

        .certificate-body {
            margin: 40px 0;
            line-height: 1.8;
        }

        .awarded-text {
            font-size: 1.1rem;
            color: #34495e;
            margin-bottom: 20px;
        }

        .recipient-name {
            font-size: 2.2rem;
            color: #2980b9;
            font-weight: bold;
            margin: 20px 0;
            text-decoration: underline;
            text-decoration-color: #3498db;
        }

        .course-title {
            font-size: 1.8rem;
            color: #8e44ad;
            font-weight: bold;
            margin: 20px 0;
        }

        .completion-text {
            font-size: 1rem;
            color: #34495e;
            margin-top: 20px;
        }

        .certificate-footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 2px solid #ecf0f1;
            padding-top: 30px;
        }

        .date-section, .signature-section {
            text-align: center;
            flex: 1;
        }

        .date-label, .signature-label {
            font-size: 0.9rem;
            color: #7f8c8d;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .date-value {
            font-size: 1.1rem;
            color: #2c3e50;
            font-weight: bold;
        }

        .signature-line {
            width: 200px;
            height: 2px;
            background: #2c3e50;
            margin: 0 auto 10px;
        }

        .signature-name {
            font-size: 1rem;
            color: #2c3e50;
            font-weight: bold;
        }

        .signature-title {
            font-size: 0.9rem;
            color: #7f8c8d;
            font-style: italic;
        }

        .certificate-seal {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 80px;
            height: 80px;
            background: radial-gradient(circle, #f39c12, #e67e22);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .progress-info {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }

        .progress-info h4 {
            color: #28a745;
            margin-bottom: 8px;
            font-size: 1.1rem;
        }

        .progress-stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            font-size: 0.9rem;
            color: #6c757d;
        }

        .stat {
            text-align: center;
        }

        .stat-number {
            display: block;
            font-size: 1.2rem;
            font-weight: bold;
            color: #495057;
        }

        @media print {
            body {
                background: white;
            }
            
            .certificate {
                box-shadow: none;
                border: 2px solid #333;
                max-width: 100%;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="certificate-seal">🏆</div>
        
        <div class="certificate-header">
            <h1 class="certificate-title">Certificate of Completion</h1>
            <p class="certificate-subtitle">Grocademy Online Learning Platform</p>
        </div>

        <div class="certificate-body">
            <p class="awarded-text">This is to certify that</p>
            
            <div class="recipient-name">${user.username}</div>
            
            <p class="awarded-text">has successfully completed the course</p>
            
            <div class="course-title">${course.title}</div>
            
            <div class="progress-info">
                <h4>Course Achievement</h4>
                <div class="progress-stats">
                    <div class="stat">
                        <span class="stat-number">${progressSummary.completed_modules}</span>
                        <span class="stat-label">Modules Completed</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${progressSummary.progress_percentage}%</span>
                        <span class="stat-label">Course Progress</span>
                    </div>
                </div>
            </div>
            
            <p class="completion-text">
                with dedication and commitment to learning excellence.<br>
                This achievement demonstrates mastery of the subject matter and commitment to professional development.
            </p>
        </div>

        <div class="certificate-footer">
            <div class="date-section">
                <p class="date-label">Date of Completion</p>
                <p class="date-value">${completionDate}</p>
            </div>
            
            <div class="signature-section">
                <div class="signature-line"></div>
                <p class="signature-name">Grocademy Team</p>
                <p class="signature-title">Course Instructor</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }
}
