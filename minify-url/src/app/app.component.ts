import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(private http: HttpClient) {}

  async onClick() {
    // this.http
    //   .post('http://localhost:3000/api/url/minify', {
    //     originalUrl: 'http://localhost:3000/api/url/minify',
    //   })
    //   .subscribe((e) => console.log(e));

    this.http
      .get('http://localhost:3000/api/url/get-by-id/68091f1ba3a7e8de7de97b52')
      .pipe(take(1))
      .subscribe((e: any) => {
        window.location.replace(e.originalUrl);
      });
  }
}
