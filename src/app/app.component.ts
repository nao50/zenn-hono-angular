import { Component, inject, OnInit  } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { PostsType } from '../../server'
import { hc } from 'hono/client'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <div>message: {{ res | json }}</div>
  `
})
export class AppComponent implements OnInit {
  res: any;
  #http = inject(HttpClient);

  async ngOnInit() {
    this.#http.get<any>('http://localhost:4000/hello').subscribe((data) => {
      this.res = data;
    });
    //
    const client = hc<PostsType>('http://localhost:4000')
    const res = await client.posts.$post({
      form: {
        title: 'Hello',
        body: 'Hono is a cool project',
      },
    })
    if (res.ok) {
      const data = await res.json()
      console.log(data.message)
    }
  }
}
