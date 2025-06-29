import { Pipe, PipeTransform } from '@angular/core';
import { AboutUs } from '../Service/about-us.service';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: AboutUs[], filterFn: (item: AboutUs) => boolean): AboutUs[] {
    return items.filter(filterFn);
  }

}
