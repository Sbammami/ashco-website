import { Injectable, Logger } from '@nestjs/common';
import { CreateContactDto } from './contact.dto';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  service?: string;
  submittedAt: Date;
  status: 'pending' | 'reviewed' | 'responded';
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly submissions: ContactSubmission[] = [];

  async createSubmission(dto: CreateContactDto): Promise<ContactSubmission> {
    const submission: ContactSubmission = {
      id: `ASHCO-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      company: dto.company,
      message: dto.message,
      service: dto.service,
      submittedAt: new Date(),
      status: 'pending',
    };

    this.submissions.push(submission);

    // Log the submission (in production, you'd send an email here)
    this.logger.log(`📩 New contact submission [${submission.id}]`);
    this.logger.log(`   From: ${submission.name} <${submission.email}>`);
    this.logger.log(`   Service: ${submission.service ?? 'Not specified'}`);
    this.logger.log(`   Message: ${submission.message.substring(0, 80)}...`);

    return submission;
  }

  async getAllSubmissions(): Promise<ContactSubmission[]> {
    return this.submissions;
  }

  async getSubmissionById(id: string): Promise<ContactSubmission | undefined> {
    return this.submissions.find((s) => s.id === id);
  }

  getStats() {
    return {
      total: this.submissions.length,
      pending: this.submissions.filter((s) => s.status === 'pending').length,
      reviewed: this.submissions.filter((s) => s.status === 'reviewed').length,
      responded: this.submissions.filter((s) => s.status === 'responded').length,
    };
  }
}
