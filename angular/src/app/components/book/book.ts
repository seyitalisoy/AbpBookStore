import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListService, LocalizationPipe, LocalizationService, PagedResultDto } from '@abp/ng.core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BookDto, BookService, BookType } from 'src/app/proxy/books';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationService, Confirmation } from '@abp/ng.theme.shared';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [
    CommonModule,
    NgxDatatableModule,
    LocalizationPipe,
    ReactiveFormsModule,
    NgbDropdownModule
  ],
  templateUrl: './book.html',
  styleUrls: ['./book.scss'],
  providers: [ListService],
})
export class BookComponent implements OnInit {
  book: PagedResultDto<BookDto> = { items: [], totalCount: 0 };
  isModalOpen = false;
  form: FormGroup;
  bookTypes: { key: string; value: number }[] = [];
  selectedBook: BookDto;

  constructor(private listService: ListService, private bookService: BookService,
    private localization: LocalizationService, private formBuilder: FormBuilder,
    private confirmation: ConfirmationService
  ) { }

  ngOnInit(): void {
    const bookStreamCreator = (query) => this.bookService.getList(query);
    this.listService.hookToQuery(bookStreamCreator).subscribe((response) => {
      this.book = response;
    });

    this.bookTypes = this.getEnumList(BookType);
  }

  createBook() {
    this.selectedBook = undefined;
    this.buildForm();
    this.isModalOpen = true;
  }

  editBook(id: string) {
    this.bookService.get(id).subscribe((book) => {
      this.selectedBook = book;
      this.buildForm();
      this.isModalOpen = true;
    });
  }

  deleteBook(id: string) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe((status) => {
      if (status === Confirmation.Status.confirm) {
        this.bookService.delete(id).subscribe(() => this.listService.get());
      }
    });
  }

  save() {
    if (this.form.invalid) {
      return;
    }
    const request = this.selectedBook?.id
      ? this.bookService.update(this.selectedBook.id, this.form.value)
      : this.bookService.create(this.form.value);

    request.subscribe(() => {
      this.isModalOpen = false;
      this.form.reset();
      this.listService.get();
    });
  }
  //form builder with validations
  buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: [null, Validators.required],
      publishDate: [null, Validators.required],
      price: [null, Validators.required]
    });
  }

  closeModal() {
    this.selectedBook = undefined;
    this.isModalOpen = false;
  }

  // enable localization Service
  convertToLocal(key: string) {
    return this.localization.instant(key);
  }

  // gets Enum Values of BookType
  getEnumList(e: any) {
    return Object.keys(e)
      .filter(k => isNaN(Number(k)))
      .map(k => ({ key: k, value: e[k] }));
  }





}
