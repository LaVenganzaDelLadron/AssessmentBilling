import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentsService, Student as StudentModel } from '../../../../shared/services/students.service';
import { AddStudentModalComponent } from '../../modals/students/add-student/add-student.modal';
import { UpdateStudentModalComponent } from '../../modals/students/update-student/update-student.modal';
import { DeleteStudentModalComponent } from '../../modals/students/delete-student/delete-student.modal';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule, AddStudentModalComponent, UpdateStudentModalComponent, DeleteStudentModalComponent],
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student implements OnInit {
  @ViewChild(AddStudentModalComponent) addModal!: AddStudentModalComponent;
  @ViewChild(UpdateStudentModalComponent) updateModal!: UpdateStudentModalComponent;
  @ViewChild(DeleteStudentModalComponent) deleteModal!: DeleteStudentModalComponent;

  students: StudentModel[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter = '';

  constructor(private studentService: StudentsService) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.isLoading = true;
    this.studentService.list().subscribe({
      next: (data: any) => {
        this.students = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load students';
        this.isLoading = false;
      }
    });
  }

  getFilteredStudents() {
    let filtered = this.students;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(s => JSON.stringify(s).toLowerCase().includes(q));
    }
    return filtered;
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(student: StudentModel) {
    this.updateModal.open(student);
  }

  openDeleteModal(student: StudentModel) {
    this.deleteModal.open(student);
  }
}
