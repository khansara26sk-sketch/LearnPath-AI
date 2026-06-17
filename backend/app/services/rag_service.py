import os
from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
# --- NAYA IMPORT YAHAN HAI ---
from langchain_pinecone import PineconeVectorStore 
from pinecone import Pinecone
import tempfile
from dotenv import load_dotenv, find_dotenv

class RAGService:
    def __init__(self):
        # 1. Force load the .env file
        load_dotenv(find_dotenv())
        
        # 2. API Key nikalo
        api_key = os.getenv("PINECONE_API_KEY")
        print(f"--- DEBUG IN RAG SERVICE ---")
        print(f"Pinecone Key Found: {api_key is not None}")
        
        if not api_key:
            raise ValueError("PINECONE_API_KEY is missing from .env file! Please check the file.")
            
        # 3. Pinecone Initialize karo
        self.pc = Pinecone(api_key=api_key)
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "learnpath-tutor")
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

    async def process_and_store_pdf(self, file: UploadFile, user_id: str):
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name
        try:
            loader = PyPDFLoader(temp_path)
            documents = loader.load()
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            chunks = text_splitter.split_documents(documents)
            for chunk in chunks:
                chunk.metadata["user_id"] = user_id
                chunk.metadata["source_file"] = file.filename
            
            # --- NAYA CODE: PineconeVectorStore use kar rahe hain ---
            PineconeVectorStore.from_documents(chunks, self.embeddings, index_name=self.index_name)
            return {"message": "PDF processed successfully"}
        finally:
            os.remove(temp_path)

    def get_relevant_context(self, query: str, user_id: str) -> str:
        # --- NAYA CODE: PineconeVectorStore use kar rahe hain ---
        vectorstore = PineconeVectorStore.from_existing_index(
            index_name=self.index_name, 
            embedding=self.embeddings
        )
        docs = vectorstore.similarity_search(query, k=3, filter={"user_id": user_id})
        return "\n\n".join([doc.page_content for doc in docs])