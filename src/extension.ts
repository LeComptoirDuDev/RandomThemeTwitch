import { ApiClient } from '@twurple/api';
import { ClientCredentialsAuthProvider } from '@twurple/auth';
import { EventSubListener } from '@twurple/eventsub';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';
import * as vscode from 'vscode';
import { clientId, clientSecret, userId } from './properties.json';

let listener: EventSubListener;


export function activate(context: vscode.ExtensionContext) {

	// console.log('Congratulations, your extension "randomthemeselectiontwitch" is now active!');

	let connection = vscode.commands.registerCommand('randomthemetwitch.connect', async () => {
		const authProvider = new ClientCredentialsAuthProvider(
			clientId,
			clientSecret
		);

		const apiClient = new ApiClient({ authProvider });

		await apiClient.eventSub.deleteAllSubscriptions();


		listener = new EventSubListener({
			apiClient,
			adapter: new NgrokAdapter(),
			secret: "HelloWorld",
		});

		await listener.listen();

		vscode.window.showInformationMessage(`RandomThemeTwitch connected`);




		await listener.subscribeToChannelRedemptionAddEvents(userId, (e) => {
			vscode.window.showInformationMessage(`${e.broadcasterDisplayName} demande ${e.rewardTitle}`);
		});

	});

	let logOut = vscode.commands.registerCommand('randomthemetwitch.logOut', async () => {
		await listener.unlisten();
		vscode.window.showInformationMessage(`RandomThemeTwitch disconnected`);

	});

	let disposable = vscode.commands.registerCommand('randomthemeselectiontwitch.helloWorld', () => {
		const folders = vscode.workspace.workspaceFolders;
		if (folders) {
			const config = vscode.workspace.getConfiguration('workbench', folders[0].uri);
			config.update('colorTheme', 'Red', false);
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(connection);
	context.subscriptions.push(logOut);
}

export function deactivate() { }
