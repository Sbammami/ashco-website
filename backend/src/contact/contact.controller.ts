import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * POST /api/contact
   * Submit a new contact/inquiry form
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submit(@Body() dto: CreateContactDto) {
    const submission = await this.contactService.createSubmission(dto);
    return {
      success: true,
      message: "Thank you for reaching out! We'll get back to you within 24 hours.",
      referenceId: submission.id,
      submittedAt: submission.submittedAt,
    };
  }

  /**
   * GET /api/contact
   * List all submissions (admin use)
   */
  @Get()
  async findAll() {
    const submissions = await this.contactService.getAllSubmissions();
    const stats = this.contactService.getStats();
    return {
      success: true,
      stats,
      data: submissions,
    };
  }

  /**
   * GET /api/contact/:id
   * Get a single submission by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const submission = await this.contactService.getSubmissionById(id);
    if (!submission) {
      return { success: false, message: 'Submission not found' };
    }
    return { success: true, data: submission };
  }
}
