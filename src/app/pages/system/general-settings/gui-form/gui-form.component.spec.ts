import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialog } from '@angular/material/dialog';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { mockCall, mockWebsocket } from 'app/core/testing/utils/mock-websocket.utils';
import { Certificate } from 'app/interfaces/certificate.interface';
import { SystemGeneralConfig } from 'app/interfaces/system-config.interface';
import { ConfirmDialogComponent } from 'app/pages/common/confirm-dialog/confirm-dialog.component';
import { IxFormsModule } from 'app/pages/common/ix/ix-forms.module';
import { IxFormHarness } from 'app/pages/common/ix/testing/ix-form.harness';
import { GuiFormComponent } from 'app/pages/system/general-settings/gui-form/gui-form.component';
import { WebSocketService, SystemGeneralService, DialogService } from 'app/services';
import { IxModalService } from 'app/services/ix-modal.service';

describe('GuiFormComponent', () => {
  let spectator: Spectator<GuiFormComponent>;
  let loader: HarnessLoader;
  let ws: WebSocketService;
  let matDialog: MatDialog;

  const mockSystemGeneralConfig = {
    crash_reporting: true,
    usage_collection: false,
    ui_address: [
      '0.0.0.0',
    ],
    ui_v6address: [
      '::',
    ],
    ui_port: 80,
    ui_httpsport: 443,
    ui_httpsredirect: false,
    ui_httpsprotocols: [
      'TLSv1.2',
      'TLSv1.3',
    ],
    ui_consolemsg: false,
    ui_certificate: {
      id: 1,
    } as Certificate,
  } as SystemGeneralConfig;

  const createComponent = createComponentFactory({
    component: GuiFormComponent,
    imports: [
      IxFormsModule,
      ReactiveFormsModule,
    ],
    providers: [
      DialogService,
      mockWebsocket([
        mockCall('system.general.update', mockSystemGeneralConfig),
        mockCall('service.restart'),
      ]),
      mockProvider(IxModalService),
      mockProvider(SystemGeneralService, {
        getGeneralConfig$: of(mockSystemGeneralConfig),
        uiCertificateOptions: () => of([{ label: 'freenas_default', value: '1' }]),
        ipChoicesv4: () => of([{ label: '0.0.0.0', value: '0.0.0.0' }]),
        ipChoicesv6: () => of([{ label: '::', value: '::' }]),
        uiHttpsProtocolsOptions: () => of([
          { label: 'TLSv1', value: 'TLSv1' },
          { label: 'TLSv1.1', value: 'TLSv1.1' },
          { label: 'TLSv1.2', value: 'TLSv1.2' },
          { label: 'TLSv1.3', value: 'TLSv1.3' },
        ]),
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    ws = spectator.inject(WebSocketService);
    matDialog = spectator.inject(MatDialog);
    jest.spyOn(matDialog, 'open').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows current values when form is being edited', async () => {
    const form = await loader.getHarness(IxFormHarness);
    const values = await form.getValues();

    /*
      TODO: Update when ix-select will be supported
    */
    expect(values).toEqual(
      {
        'Crash reporting': true,
        'Show Console Messages': false,
        'Usage collection': false,
        'Web Interface HTTP -> HTTPS Redirect': false,
        'Web Interface HTTP Port': '80',
        'Web Interface HTTPS Port': '443',
      },
    );
  });

  it('sends an update payload to websocket and closes modal when save is pressed', async () => {
    const form = await loader.getHarness(IxFormHarness);
    await form.fillForm({
      'Show Console Messages': true,
      'Usage collection': true,
    });

    const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
    await saveButton.click();

    expect(ws.call).toHaveBeenCalledWith('system.general.update', [
      {
        ...mockSystemGeneralConfig,
        ui_certificate: 1,
        ui_consolemsg: true,
        usage_collection: true,
      },
    ]);
  });

  it('shows confirm dialog if service restart is needed', async () => {
    const form = await loader.getHarness(IxFormHarness);
    await form.fillForm({
      'Web Interface HTTP -> HTTPS Redirect': true,
    });

    const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
    await saveButton.click();

    expect(matDialog.open).toHaveBeenCalledWith(
      ConfirmDialogComponent,
      {
        disableClose: false,
      },
    );
  });
});
