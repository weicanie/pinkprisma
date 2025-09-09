import type { InterviewQuestion } from '@prisma-ai/shared';
import axios, { type AxiosRequestConfig } from 'axios';
import { chunk } from 'lodash';

interface AnkiNote {
	deckName: string;
	modelName: string;
	fields: {
		[key: string]: string;
	};
	tags: string[];
}

interface AnkiAddNotesParams {
	notes: AnkiNote[];
}

const DUMPLICATE_ERROR_MESSAGE = 'cannot create note because it is a duplicate';
const DUPLICATE_TITLE_ERROR_MESSAGE = `['cannot create note because it is a duplicate']`;
export class AnkiUploadService {
	private readonly ANKI_CONNECT_URL = 'http://localhost:8765';
	private readonly ANKI_MODEL_NAME = '面试题2.0';
	private readonly ANKI_API_BATCH_SIZE = 20;

	private progress: { total: number; completed: number } = { total: 0, completed: 0 };

	constructor(private onProgressUpdate: (progress: { total: number; completed: number }) => void) {}

	private updateProgress(total: number, completed: number) {
		this.progress = { total, completed };
		this.onProgressUpdate(this.progress);
	}

	public getProgress() {
		return this.progress;
	}

	async uploadQuestions(
		articles: InterviewQuestion[]
	): Promise<{ articleId: number; ankiNoteId: number }[]> {
		this.updateProgress(articles.length, 0);

		const uploadedResults: { articleId: number; ankiNoteId: number }[] = [];
		const articleChunks = chunk(articles, this.ANKI_API_BATCH_SIZE);

		for (const articleChunk of articleChunks) {
			const notes = articleChunk.map(article => this.buildAnkiNote(article));
			await this.createDecks(notes.map(n => n.deckName));

			const notesToAdd: AnkiNote[] = [];
			const articlesToAdd: InterviewQuestion[] = [];
			const checkResults = await this.canAddNotes(notes);
			for (let i = 0; i < checkResults.length; i++) {
				if (checkResults[i].canAdd) {
					notesToAdd.push(notes[i]);
					articlesToAdd.push(articleChunk[i]);
					//跳过anki中标题已存在的面试题
				} else if (checkResults[i].error !== DUMPLICATE_ERROR_MESSAGE) {
					uploadedResults.push({
						articleId: articleChunk[i].id,
						ankiNoteId: -1
					});
					console.warn(`Note for "${notes[i].fields['标题']}" is a duplicate and will be skipped.`);
				}
			}
			//确保要上传的面试题之间标题不重复
			const map = new Map<string, AnkiNote>();
			for (let i = 0; i < notesToAdd.length; i++) {
				const note = notesToAdd[i];
				if (map.has(note.fields['标题'])) {
					console.warn(
						`Article with title "${note.fields['标题']}" already exists and will be skipped.`
					);
					uploadedResults.push({
						articleId: articlesToAdd[i].id,
						ankiNoteId: -1
					});
					// 删除重复的面试题
					notesToAdd.splice(i, 1);
					articlesToAdd.splice(i, 1);
					i--;
				} else {
					map.set(note.fields['标题'], note);
				}
			}

			if (notesToAdd.length > 0) {
				const addedNoteIds = await this.addNotes(notesToAdd);
				for (let i = 0; i < addedNoteIds.length; i++) {
					if (addedNoteIds[i]) {
						uploadedResults.push({
							articleId: articlesToAdd[i].id,
							ankiNoteId: addedNoteIds[i] as number
						});
					}
				}
			}

			this.updateProgress(articles.length, this.progress.completed + articleChunk.length);
		}
		return uploadedResults;
	}

	private buildAnkiNote(qdata: InterviewQuestion): AnkiNote {
		const deckName = `${qdata?.own ? '我的面经' : '公共面经'}::${qdata.job_type ?? '其它'}::${qdata.content_type}`;

		return {
			deckName,
			modelName: this.ANKI_MODEL_NAME,
			fields: {
				笔记: qdata.user_note ?? '暂无',
				标题: qdata.title ?? '无',
				内容: qdata.content ?? '无',
				要点: qdata.gist ?? '无',
				思维导图:
					qdata.content_mindmap
						?.replaceAll('- ###', '###')
						.replaceAll('- ####', '####')
						.replaceAll('- ##', '##') ?? '无',
				标签: qdata.content_type ?? '无',
				难度: String(qdata.hard ?? '无'),
				版本: qdata.version ?? 'v1.0.0',
				更新日志: qdata.change_log ?? 'v1.0.0 题目创建'
			},
			tags: [qdata.content_type ?? '无标签']
		};
	}

	private async createDecks(deckNames: string[]): Promise<void> {
		const uniqueDeckNames = [...new Set(deckNames)];
		for (const deckName of uniqueDeckNames) {
			await this.requestAnkiConnect('createDeck', { deck: deckName });
		}
	}

	private async canAddNotes(notes: AnkiNote[]): Promise<{ canAdd: boolean; error?: string }[]> {
		return this.requestAnkiConnect('canAddNotesWithErrorDetail', { notes });
	}

	private async addNotes(notes: AnkiNote[]): Promise<(number | null)[]> {
		return this.requestAnkiConnect('addNotes', { notes });
	}

	private async requestAnkiConnect(
		action: string,
		params: AnkiAddNotesParams | object
	): Promise<any> {
		try {
			const requestConfig: AxiosRequestConfig = {
				// In browser environment, we don't use http.Agent.
				// Axios handles connections automatically.
			};
			const { data } = await axios.post(
				this.ANKI_CONNECT_URL,
				{
					action,
					version: 6,
					params
				},
				requestConfig
			);

			if (data.error) {
				throw new Error(`AnkiConnect Error: ${data.error}`);
			}
			return data.result;
		} catch (error: any) {
			if (error.message.includes(DUPLICATE_TITLE_ERROR_MESSAGE)) {
				//应该不会出现，因为已经处理了重复的面试题
				console.warn(`some notes are duplicate and skipped.`);
				return;
			}
			console.error(`AnkiConnect request failed: ${error.message}`);
			throw error;
		}
	}
}

export class AnkiUploadServiceV2 {
	private readonly ANKI_CONNECT_URL = 'http://localhost:8765';
	private readonly ANKI_MODEL_NAME = '面试题3.0';
	private readonly ANKI_API_BATCH_SIZE = 20;

	private progress: { total: number; completed: number } = { total: 0, completed: 0 };

	constructor(private onProgressUpdate: (progress: { total: number; completed: number }) => void) {}

	private updateProgress(total: number, completed: number) {
		this.progress = { total, completed };
		this.onProgressUpdate(this.progress);
	}

	public getProgress() {
		return this.progress;
	}

	async uploadQuestions(
		articles: InterviewQuestion[]
	): Promise<{ articleId: number; ankiNoteId: number }[]> {
		this.updateProgress(articles.length, 0);

		const uploadedResults: { articleId: number; ankiNoteId: number }[] = [];
		const articleChunks = chunk(articles, this.ANKI_API_BATCH_SIZE);

		for (const articleChunk of articleChunks) {
			const notes = articleChunk.map(article => this.buildAnkiNote(article));
			await this.createDecks(notes.map(n => n.deckName));

			const notesToAdd: AnkiNote[] = [];
			const articlesToAdd: InterviewQuestion[] = [];
			const checkResults = await this.canAddNotes(notes);
			for (let i = 0; i < checkResults.length; i++) {
				if (checkResults[i].canAdd) {
					notesToAdd.push(notes[i]);
					articlesToAdd.push(articleChunk[i]);
					//跳过anki中标题已存在的面试题
				} else if (checkResults[i].error !== DUMPLICATE_ERROR_MESSAGE) {
					uploadedResults.push({
						articleId: articleChunk[i].id,
						ankiNoteId: -1
					});
					console.warn(`Note for "${notes[i].fields['标题']}" is a duplicate and will be skipped.`);
				}
			}
			//确保要上传的面试题之间标题不重复
			const map = new Map<string, AnkiNote>();
			for (let i = 0; i < notesToAdd.length; i++) {
				const note = notesToAdd[i];
				if (map.has(note.fields['标题'])) {
					console.warn(
						`Article with title "${note.fields['标题']}" already exists and will be skipped.`
					);
					uploadedResults.push({
						articleId: articlesToAdd[i].id,
						ankiNoteId: -1
					});
					// 删除重复的面试题
					notesToAdd.splice(i, 1);
					articlesToAdd.splice(i, 1);
					i--;
				} else {
					map.set(note.fields['标题'], note);
				}
			}

			if (notesToAdd.length > 0) {
				const addedNoteIds = await this.addNotes(notesToAdd);
				for (let i = 0; i < addedNoteIds.length; i++) {
					if (addedNoteIds[i]) {
						uploadedResults.push({
							articleId: articlesToAdd[i].id,
							ankiNoteId: addedNoteIds[i] as number
						});
					}
				}
			}

			this.updateProgress(articles.length, this.progress.completed + articleChunk.length);
		}
		return uploadedResults;
	}

	private buildAnkiNote(qdata: InterviewQuestion): AnkiNote {
		const deckName = `${qdata?.own ? '面经面试题' : '面经面试题'}::${qdata.job_type ?? '其它'}::${qdata.content_type}`;

		return {
			deckName,
			modelName: this.ANKI_MODEL_NAME,
			fields: {
				标题: qdata.title ?? '无',
				内容: `[${qdata.title}](https://pinkprisma.com/main/interview-question/detail/${qdata.id})`
			},
			tags: [qdata.content_type ?? '无标签']
		};
	}

	private async createDecks(deckNames: string[]): Promise<void> {
		const uniqueDeckNames = [...new Set(deckNames)];
		for (const deckName of uniqueDeckNames) {
			await this.requestAnkiConnect('createDeck', { deck: deckName });
		}
	}

	private async canAddNotes(notes: AnkiNote[]): Promise<{ canAdd: boolean; error?: string }[]> {
		return this.requestAnkiConnect('canAddNotesWithErrorDetail', { notes });
	}

	private async addNotes(notes: AnkiNote[]): Promise<(number | null)[]> {
		return this.requestAnkiConnect('addNotes', { notes });
	}

	private async requestAnkiConnect(
		action: string,
		params: AnkiAddNotesParams | object
	): Promise<any> {
		try {
			const requestConfig: AxiosRequestConfig = {
				// In browser environment, we don't use http.Agent.
				// Axios handles connections automatically.
			};
			const { data } = await axios.post(
				this.ANKI_CONNECT_URL,
				{
					action,
					version: 6,
					params
				},
				requestConfig
			);

			if (data.error) {
				throw new Error(`AnkiConnect Error: ${data.error}`);
			}
			return data.result;
		} catch (error: any) {
			if (error.message.includes(DUPLICATE_TITLE_ERROR_MESSAGE)) {
				//应该不会出现，因为已经处理了重复的面试题
				console.warn(`some notes are duplicate and skipped.`);
				return;
			}
			console.error(`AnkiConnect request failed: ${error.message}`);
			throw error;
		}
	}
}
