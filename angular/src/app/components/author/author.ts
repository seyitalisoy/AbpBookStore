import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, Confirmation } from '@abp/ng.theme.shared';
import { AuthorService, AuthorDto } from 'src/app/proxy/authors';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LocalizationService, LocalizationPipe, PermissionDirective } from '@abp/ng.core';

@Component({
  selector: 'app-author',
  standalone: true,
  templateUrl: './author.html',
  styleUrls: ['./author.scss'],
  providers: [ListService],
  imports: [CommonModule, NgxDatatableModule, NgbDropdownModule, LocalizationPipe, PermissionDirective,ReactiveFormsModule],
})
export class AuthorComponent implements OnInit {
  author: PagedResultDto<AuthorDto> = { items: [], totalCount: 0 };
  isModalOpen = false;
  form: FormGroup;
  selectedAuthor: AuthorDto;

  constructor(
    public readonly list: ListService,
    private authorService: AuthorService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private localization: LocalizationService
  ) {}

  ngOnInit(): void {
    const authorStreamCreator = (query) => this.authorService.getList(query);
    this.list.hookToQuery(authorStreamCreator).subscribe((response) => {
      this.author = response;
    });
  }

  createAuthor() {
    this.selectedAuthor = undefined;
    this.form = this.fb.group({
      name: ['', Validators.required],
      birthDate: [null, Validators.required],
      shortBio: ['', Validators.required],
    });
    this.isModalOpen = true;
  }

  editAuthor(id: string) {
  this.authorService.get(id).subscribe((author) => {
    this.selectedAuthor = author;

    const formattedDate = author.birthDate
      ? new Date(author.birthDate).toISOString().substring(0, 10)
      : null;

    this.form = this.fb.group({
      name: [author.name, Validators.required],
      birthDate: [formattedDate, Validators.required],
      shortBio: [author.shortBio, Validators.required],
    });

    this.isModalOpen = true;
  });
}


  save() {
    if (!this.form.valid) {
      console.log("form geçersiz")
      return;
    }

    const formValue = this.form.value;

    if (this.selectedAuthor && this.selectedAuthor.id) {
      this.authorService.update(this.selectedAuthor.id, formValue).subscribe(() => {
        this.isModalOpen = false;
        this.form.reset();
        this.list.get();
      });
    } else {
      this.authorService.create(formValue).subscribe(() => {
        this.isModalOpen = false;
        this.form.reset();
        this.list.get();
      });
    }
  }

  delete(id: string) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe((status) => {
      if (status === Confirmation.Status.confirm) {
        this.authorService.delete(id).subscribe(() => this.list.get());
      }
    });
  }

  closeModal() {
    this.selectedAuthor = undefined;
    this.form.reset();
    this.isModalOpen = false;
  }

  convertToLocal(key: string) {
    return this.localization.instant(key);
  }
}
