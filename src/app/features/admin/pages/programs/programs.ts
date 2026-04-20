import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramsService, Program } from '../../../../shared/services/programs.service';
import { AddProgramsModalComponent } from '../../modals/programs/add-programs/add-programs.modal';
import { UpdateProgramsModalComponent } from '../../modals/programs/update-programs/update-programs.modal';
import { DeleteProgramsModalComponent } from '../../modals/programs/delete-programs/delete-programs.modal';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, FormsModule, AddProgramsModalComponent, UpdateProgramsModalComponent, DeleteProgramsModalComponent],
  templateUrl: './programs.html',
  styleUrl: './programs.css',
})
export class Programs implements OnInit {
  @ViewChild(AddProgramsModalComponent) addModal!: AddProgramsModalComponent;
  @ViewChild(UpdateProgramsModalComponent) updateModal!: UpdateProgramsModalComponent;
  @ViewChild(DeleteProgramsModalComponent) deleteModal!: DeleteProgramsModalComponent;

  programs: Program[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private programService: ProgramsService) {}

  ngOnInit() {
    this.loadPrograms();
  }

  loadPrograms() {
    this.isLoading = true;
    this.programService.list().subscribe({
      next: (data: any) => {
        this.programs = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load programs';
        this.isLoading = false;
      }
    });
  }

  getFilteredPrograms() {
    if (!this.searchQuery) return this.programs;
    const q = this.searchQuery.toLowerCase();
    return this.programs.filter(p => JSON.stringify(p).toLowerCase().includes(q));
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(program: Program) {
    this.updateModal.open(program);
  }

  openDeleteModal(program: Program) {
    this.deleteModal.open(program);
  }
}
