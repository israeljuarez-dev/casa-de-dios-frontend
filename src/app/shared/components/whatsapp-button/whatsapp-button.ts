import { 
  ChangeDetectionStrategy,
  Component,
  computed,
  input 
} from '@angular/core';

@Component({
  selector: 'app-whatsapp-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.css',
})
export class WhatsappButton {
  phoneCode = input<string | null>(null);
  phoneNumber = input<string | null>(null);

  readonly whatsappUrl = computed(() => {
    const code = this.phoneCode();
    const number = this.phoneNumber();
    if (!code || !number) return null;
    return `https://wa.me/${code}${number}`;
  });
}