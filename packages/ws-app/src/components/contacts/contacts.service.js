import { ApiService } from '../../common/api/api.service';
import { environment } from '../../environment';

export class ContactsService {

  static data$() {
    if (environment.flags.production) {
      return ApiService.get$('/contacts/data');
    } else {
      return ApiService.get$('/contacts/data.json');
    }
  }

  static submit$(payload) {
    if (environment.flags.production) {
      return ApiService.post$('/contacts/submit', payload);
    } else {
      return ApiService.get$('/contacts/submit.json');
    }
  }

}
