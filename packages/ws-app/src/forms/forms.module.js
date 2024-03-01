import { ControlCheckbox } from './controls/control-checkbox.component';
import { ControlCheckfield } from './controls/control-checkfield.component';
import { ControlPrivacy } from './controls/control-privacy.component';
import { ControlSelect } from './controls/control-select.component';
import { ControlText } from './controls/control-text.component';
import { ControlTextarea } from './controls/control-textarea.component';
import { TestComponent } from './test/test.component';

export const FormsModule = {
  factories: [
    ControlCheckfield,
    ControlCheckbox,
    ControlPrivacy,
    ControlSelect,
    ControlText,
    ControlTextarea,
    TestComponent,
  ],
};
