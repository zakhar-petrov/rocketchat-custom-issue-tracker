import {ISettingsExtend} from "@rocket.chat/apps-engine/definition/accessors";
import {ISettingRead} from "@rocket.chat/apps-engine/definition/accessors/ISettingRead";
import {SettingType} from "@rocket.chat/apps-engine/definition/settings";
import {ISetting} from "@rocket.chat/apps-ts-definition/settings";
import {expect, should} from 'chai';
import 'mocha';
import {createSandbox} from 'sinon';
import {Settings} from "./Settings";

describe('Settings', () => {
    describe('#onUpdate', () => {
        it('should set base url', () => {
            const settings = new Settings();
            const baseUrl = 'test-base-url';
            const setting = {'id': Settings.BASE_URL_SETTING_ID, 'value': baseUrl} as ISetting;

            settings.onUpdate(setting);

            expect(settings.baseUrl).to.equal(baseUrl);
            expect(settings.issuePattern).to.be.undefined;
        });

        it('should set issue pattern', () => {
            const settings = new Settings();
            const issuePattern = 'test-issue-pattern';
            const setting = {'id': Settings.ISSUE_PATTERN_SETTING_ID, 'value': issuePattern} as ISetting;

            settings.onUpdate(setting);

            expect(settings.issuePattern).to.equal(issuePattern);
            expect(settings.baseUrl).to.be.undefined;
        });

        it('should set nothing', () => {
            const settings = new Settings();
            const setting = {'id': 'unknown-setting', 'value': 'setting-test-value'} as ISetting;

            settings.onUpdate(setting);

            should().not.exist(settings.baseUrl);
            should().not.exist(settings.issuePattern);
        });
    });

    describe('#setFrom', () => {
        it('should set base url', async () => {
            const settings = new Settings();
            const baseUrl = 'test-base-url';
            const settingRead = {
                async getValueById(id: string): Promise<any> {
                    if (id === Settings.BASE_URL_SETTING_ID) {
                        return baseUrl;
                    }
                    return null;
                }
            } as ISettingRead;

            await settings.setFrom(settingRead);

            expect(settings.baseUrl).to.equal(baseUrl);
            should().not.exist(settings.issuePattern);
        });

        it('should set issue pattern', async () => {
            const settings = new Settings();
            const issuePattern = 'test-issue-pattern';
            const settingRead = {
                async getValueById(id: string): Promise<any> {
                    if (id === Settings.ISSUE_PATTERN_SETTING_ID) {
                        return issuePattern;
                    }
                    return null;
                }
            } as ISettingRead;

            await settings.setFrom(settingRead);

            expect(settings.issuePattern).to.equal(issuePattern);
            should().not.exist(settings.baseUrl);
        });

        it('should set nothing', async () => {
            const settings = new Settings();
            const settingRead = {
                async getValueById(_id: string): Promise<any> {
                    return null;
                }
            } as ISettingRead;

            await settings.setFrom(settingRead);

            should().not.exist(settings.baseUrl);
            should().not.exist(settings.issuePattern);
        });
    });

    describe('#init', () => {
        const settingExtend = <ISettingsExtend>{
            async provideSetting(_setting: ISetting) {
            }
        };
        const sandbox = createSandbox();
        let provideSetting;

        beforeEach(function () {
            provideSetting = sandbox.spy(settingExtend, 'provideSetting');
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should provide settings', async () => {
            const settings = new Settings();

            await settings.init(settingExtend);

            expect(provideSetting.calledTwice).to.be.true;
            const baseUrlSetting = provideSetting.getCall(0).args[0];
            expect(baseUrlSetting.id).to.equal(Settings.BASE_URL_SETTING_ID);
            expect(baseUrlSetting.type).to.equal(SettingType.STRING);
            expect(baseUrlSetting.packageValue).to.equal('');
            expect(baseUrlSetting.required).to.be.true;
            expect(baseUrlSetting.public).to.be.true;
            expect(baseUrlSetting.i18nLabel).to.equal('YouTrack_Base_URL');
            expect(baseUrlSetting.i18nDescription).to.equal('YouTrack_Base_URL_Description');
            const issuePatternSetting = provideSetting.getCall(1).args[0];
            expect(issuePatternSetting.id).to.equal(Settings.ISSUE_PATTERN_SETTING_ID);
            expect(issuePatternSetting.type).to.equal(SettingType.STRING);
            expect(issuePatternSetting.packageValue).to.equal(Settings.DEFAULT_ISSUE_PATTERN);
            expect(issuePatternSetting.required).to.be.true;
            expect(issuePatternSetting.public).to.be.true;
            expect(issuePatternSetting.i18nLabel).to.equal('Issue_Pattern');
            expect(issuePatternSetting.i18nDescription).to.equal('Issue_Pattern_Description');
        });
    });
});