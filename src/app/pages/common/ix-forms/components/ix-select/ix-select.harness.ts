import { ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
import { MatSelectHarness, SelectHarnessFilters } from '@angular/material/select/testing';
import { IxFormControlHarness } from 'app/pages/common/ix-forms/interfaces/ix-form-control-harness.interface';

export interface IxSelectHarnessFilters extends SelectHarnessFilters {
  label: string;
}

export class IxSelectHarness extends ComponentHarness implements IxFormControlHarness {
  static hostSelector = 'ix-select';

  static with(options: IxSelectHarnessFilters): HarnessPredicate<IxSelectHarness> {
    return new HarnessPredicate(IxSelectHarness, options)
      .addOption('label', options.label,
        (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label));
  }

  getSelectHarness = this.locatorFor(MatSelectHarness);

  async getLabelText(): Promise<string> {
    const label = await this.locatorFor('label')();
    return label.text({ exclude: '.required' });
  }

  async getErrorText(): Promise<string> {
    const label = await this.locatorForOptional('ix-errors')();
    return label?.text() || '';
  }

  async getValue(): Promise<string | string[]> {
    const select = await this.getSelectHarness();
    await select.open();

    if (await select.isMultiple()) {
      const options = await select.getOptions({ isSelected: true });
      const optionTexts = options.map((option) => option.getText());

      return Promise.all(optionTexts);
    }

    return (await this.getSelectHarness()).getValueText();
  }

  /**
   * @param newLabels option label or labels to be selected
   */
  async setValue(newLabels: string | string[]): Promise<void> {
    const select = (await this.getSelectHarness());
    await select.open();

    if (await select.isMultiple()) {
      // Unselect old options manually
      if (!(await select.isEmpty())) {
        const selectedOptions = await select.getOptions({ isSelected: true });
        await parallel(() => selectedOptions.map((option) => option.click()));
      }

      const labelsToClick = Array.isArray(newLabels) ? newLabels : [newLabels];
      await parallel(() => {
        return (labelsToClick).map((label) => select.clickOptions({ text: label }));
      });
      return;
    }

    await select.clickOptions({ text: newLabels as string });
  }
}
