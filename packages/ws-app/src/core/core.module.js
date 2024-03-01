import { AttributeComponent } from './attribute/attribute.component';
import { ClassComponent } from './class/class.component';
import { EventComponent } from './event/event.component';
import { ForComponent } from './for/for.component';
import { HtmlComponent } from './html/html.component';
import { IfComponent } from './if/if.component';
import { Json } from './json/json';
import { StyleComponent } from './style/style.component';
import { TextComponent } from './text/text.component';

export const CoreModule = {
  factories: [
    AttributeComponent,
    ClassComponent,
    EventComponent,
    ForComponent,
    HtmlComponent,
    IfComponent,
    StyleComponent,
    TextComponent,
  ],
  pipes: [
    Json,
  ],
};
