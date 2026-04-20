import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProgramsService } from '../../../../../shared/services/programs.service';

@Component({
  selector: 'app-update-programs-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-programs.modal.html',
  styleUrl: './update-programs.modal.css'
})
export class UpdateProgramsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: any = null;

  program_name = '';
  program_code = '';
  description = '';

  constructor(private programsService: ProgramsService) {}

  ngOnInit(): void {}

  open(entity: any): void {
    this.currentEntity = entity;
    this.program_name = entity.program_name;
    this.program_code = entity.program_code;
    this.description = entity.description;
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  validate(): boolean {
    if (!this.program_name || !this.program_code || !this.description) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    return true;
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    const data = {
      program_name: this.program_name,
      program_code: this.program_code,
      description: this.description
    };

    this.programsService.update(this.currentEntity.id, data).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to update program';
      }
    });
  }

  private resetForm(): void {
    this.program_name = '';
    this.program_code = '';
    this.description = '';
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
