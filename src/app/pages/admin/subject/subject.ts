import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { SubjectService } from '../../../services/subject.service';
import {
  Subject as SubjectModel,
  SubjectProgram
} from '../../../models/subject.model';

@Component({
  selector: 'app-subject',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subject.html',
  styleUrl: './subject.css'
})
export class Subject implements OnInit {
  private readonly subjectService = inject(SubjectService);
  private readonly cdr = inject(ChangeDetectorRef);

  subjects: SubjectModel[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.subjectService.getSubjects().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (subjects: SubjectModel[]) => {
        console.log('SUBJECTS FROM API', subjects);
        this.subjects = subjects;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('SUBJECTS API ERROR', error);
        this.errorMessage = error.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackBySubjectId(_: number, item: SubjectModel): number | string {
    return item.id;
  }

  trackByProgramId(_: number, item: SubjectProgram): number | string {
    return item.id;
  }
}
