import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ProgramService } from '../../../services/program.service';
import { Program, ProgramStatus } from '../../../models/program.model';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './classes.html',
  styleUrl: './classes.css'
})
export class Classes implements OnInit {
  private readonly programService = inject(ProgramService);
  private readonly cdr = inject(ChangeDetectorRef);

  programs: Program[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.programService.getPrograms().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (programs: Program[]) => {
        console.log('PROGRAMS FROM API', programs);
        this.programs = programs;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('PROGRAMS API ERROR', error);
        this.errorMessage = error.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  badgeClass(status: ProgramStatus): string {
    return status === 'active'
      ? 'bg-emerald-100 text-emerald-700 ring-emerald-600/20'
      : 'bg-rose-100 text-rose-700 ring-rose-600/20';
  }

  trackByProgramId(_: number, program: Program): string {
    return program.id;
  }
}
