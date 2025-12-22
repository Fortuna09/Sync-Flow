import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SUPABASE_CLIENT } from './core/tokens/supabase.token';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private supabase = inject(SUPABASE_CLIENT);

  ngOnInit() {
    console.log('--- TESTE DE CONEXÃO ---');
    console.log('Supabase Client inicializado:', this.supabase);
    this.supabase.auth.getSession().then(({ data }) => {
        console.log('Sessão atual:', data.session); 
    });
  }
}
