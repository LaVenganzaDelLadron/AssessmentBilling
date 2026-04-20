import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectsService, Subject } from '../../../../shared/services/subjects.service';
import { AddSubjectModalComponent } from '../../modals/subjects/add-subject/add-subject.modal';
import { UpdateSubjectModalComponent } from '../../modals/subjects/update-subject/update-subject.modal';
import { DeleteSubjectModalComponent } from '../../modals/subjects/delete-subject/delete-subject.modal';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, AddSubjectModalComponent, UpdateSubjectModalComponent, DeleteSubjectModalComponent],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css',
})
export class Subjects implements OnInit {
  @ViewChild(AddSubjectModalComponent) addModal!: AddSubjectModalComponent;
  @ViewChild(UpdateSubjectModalComponent) updateModal!: UpdateSubjectModalComponent;
  @ViewChild(DeleteSubjectModalComponent) deleteModal!: DeleteSubjectModalComponent;

  subjects: Subject[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private subjectService: SubjectsService) {}

  ngOnInit() {
    this.loadSubjects();
  }

  loadSubjects() {
    this.isLoading = true;
    this.subjectService.list().subscribe({
      next: (data: any) => {
        this.subjects = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load subjects';
        this.isLoading = false;
      }
    });
  }

  getFilteredSubjects() {
    if (!this.searchQuery) return this.subjects;
    const q = this.searchQuery.toLowerCase();
    return this.subjects.filter(s => JSON.stringify(s).toLowerCase().includes(q));
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(subject: Subject) {
    this.updateModal.open(subject);
  }

  openDeleteModal(subject: Subject) {
    this.deleteModal.open(subject);
  }
}
