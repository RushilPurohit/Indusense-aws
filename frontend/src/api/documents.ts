import client from './client';
import { Document, Page } from '../types';

export const uploadDocument = async (file: File): Promise<{ doc_id: string; filename: string; status: string; message: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getDocuments = async (): Promise<Document[]> => {
  const response = await client.get('/documents');
  return response.data;
};

export const getDocument = async (id: string): Promise<Document> => {
  const response = await client.get(`/documents/${id}`);
  return response.data;
};

export const getDocumentStatus = async (id: string): Promise<Document> => {
  const response = await client.get(`/documents/${id}/status`);
  return response.data;
};

export const getDocumentPage = async (id: string, pageNumber: number): Promise<Page> => {
  const response = await client.get(`/documents/${id}/pages/${pageNumber}`);
  return response.data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await client.delete(`/documents/${id}`);
};
