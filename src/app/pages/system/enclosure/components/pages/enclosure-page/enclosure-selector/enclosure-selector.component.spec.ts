import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import {
  EnclosureSelectorComponent,
} from 'app/pages/system/enclosure/components/pages/enclosure-page/enclosure-selector/enclosure-selector.component';
import {
  EnclosureSideComponent,
} from 'app/pages/system/enclosure/components/pages/enclosure-page/enclosure-side/enclosure-side.component';
import { EnclosureStore } from 'app/pages/system/enclosure/services/enclosure.store';

describe('EnclosureSelectorComponent', () => {
  let spectator: Spectator<EnclosureSelectorComponent>;
  const enclosures = [
    { id: '1', label: 'M40' },
    { id: '2', label: 'ES24N' },
  ];
  const createComponent = createComponentFactory({
    component: EnclosureSelectorComponent,
    declarations: [MockComponent(EnclosureSideComponent)],
    providers: [
      mockProvider(EnclosureStore, {
        selectedEnclosure: () => ({ id: '1' }),
        enclosures: () => enclosures,
        selectEnclosure: jest.fn(),
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('shows a list of available enclosures', () => {
    const enclosureElements = spectator.queryAll('.enclosure');
    expect(enclosureElements).toHaveLength(2);
    expect(enclosureElements[0]).toHaveText('M40 (1)');
    expect(enclosureElements[1]).toHaveText('ES24N (2)');

    const enclosureSvg1 = spectator.query(EnclosureSideComponent, { parentSelector: '.enclosure:first-of-type' });
    expect(enclosureSvg1.enclosure).toBe(enclosures[0]);

    const enclosureSvg2 = spectator.query(EnclosureSideComponent, { parentSelector: '.enclosure:last-of-type' });
    expect(enclosureSvg2.enclosure).toBe(enclosures[1]);
  });

  it('marks currently selected enclosure', () => {
    const enclosureElements = spectator.queryAll('.enclosure');
    expect(enclosureElements[0]).toHaveClass('active');
    expect(enclosureElements[1]).not.toHaveClass('active');
  });

  it('selects another enclosure when user clicks on it', () => {
    const enclosureElements = spectator.queryAll('.enclosure');
    spectator.click(enclosureElements[1]);
    expect(spectator.inject(EnclosureStore).selectEnclosure).toHaveBeenCalledWith('2');
  });
});