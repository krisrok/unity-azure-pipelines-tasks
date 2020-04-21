import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { getUnityEditorVersion } from './unity-activate-license-shared';
import { UnityToolRunner, UnityPathTools } from '@dinomite-studios/unity-utilities';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityVersion = await getUnityEditorVersion();
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(tl.getInput('unityEditorsPathMode', true)!, tl.getInput('customUnityEditorsPath'))
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion);

        const logFilePath = path.join(tl.getVariable('Build.Repository.LocalPath')!, 'UnityReturnLicenseLog.log');
        tl.setVariable('releaseLicenseLogFilePath', logFilePath);

        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-quit')
            .arg('-returnlicense')
            .arg('-logfile').arg(logFilePath);

        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        if (result === 0) {
            const returnLicenseSuccessLog = tl.loc('SuccessLicenseReturned');
            console.log(returnLicenseSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, returnLicenseSuccessLog);
        } else {
            const returnLicenseFailLog = `${tl.loc('FailUnity')} ${result}`;
            console.error(returnLicenseFailLog);
            tl.setResult(tl.TaskResult.Failed, returnLicenseFailLog);
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
            tl.setResult(tl.TaskResult.Failed, e.message);
        } else {
            console.error(e);
            tl.setResult(tl.TaskResult.Failed, e);
        }
    }
}

run();
