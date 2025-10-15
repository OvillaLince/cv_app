import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MyApiService {
  private apiUrl = 'https://37a4d94fef26.ngrok-free.app';

  constructor(private http: HttpClient) {}

  getExampleData() {
    return this.http.get(`${this.apiUrl}/weatherforecast`);
  }
}