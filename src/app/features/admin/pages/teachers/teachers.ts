import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeachersService, Teacher } from '../../../../shared/services/teachers.service';
import { AddTeacherModalComponent } from '../../modals/teachers/add-teacher/add-teacher.modal';
import { UpdateTeacherModalComponent } from '../../modals/teachers/update-teacher/update-teacher.modal';
import { DeleteTeacherModalComponent } from '../../modals/teachers/delete-teacher/delete-teacher.modal';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule, AddTeacherModalComponent, UpdateTeacherModalComponent, DeleteTeacherModalComponent],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers implements OnInit {
  @ViewChild(AddTeacherModalComponent) addModal!: AddTeacherModalComponent;
  @ViewChild(UpdateTeacherModalComponent) updateModal!: UpdateTeacherModalComponent;
  @ViewChild(DeleteTeacherModalComponent) deleteModal!: DeleteTeacherModalComponent;

  teachers: Teacher[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private teacherService: TeachersService) {}

  ngOnInit() {
    this.loadTeachers();
  }

  loadTeachers() {
    this.isLoading = true;
    this.teacherService.list().subscribe({
      next: (data: any) => {
        this.teachers = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load teachers';
        this.isLoading = false;
      }
    });
  }

  getFilteredTeachers() {
    if (!this.searchQuery) return this.teachers;
    const q = this.searchQuery.toLowerCase();
    return this.teachers.filter(t => JSON.stringify(t).toLowerCase().includes(q));
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(teacher: Teacher) {
    this.updateModal.open(teacher);
  }

  openDeleteModal(teacher: Teacher) {
    this.deleteModal.open(teacher);
  }
}
