
import { authFetch } from './auth';

export const API_BASE_URL = "https://klk-faill-2v6t.vercel.app";

export async function createContribution(formData: FormData) {
  return authFetch('/api/contributions/create/', {
    method: 'POST',
    body: formData,
  });
}

export async function updateContribution(id: string, formData: FormData) {
  return authFetch(`/api/contributions/${id}/edit/`, {
    method: 'PUT',
    body: formData,
  });
}

export async function addVideoToContribution(id: string, data: { title: string; video_file?: File; video_url?: string; }) {
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.video_file) {
    formData.append('video_file', data.video_file);
  } else if (data.video_url) {
    formData.append('video_url', data.video_url);
  }

  return authFetch(`/api/contributions/${id}/videos/`, {
    method: 'POST',
    body: formData,
  });
}

export async function updateVideoInContribution(contributionId: string, videoId: string, data: { title: string, video_url: string }) {
  return authFetch(`/api/contributions/${contributionId}/videos/${videoId}/`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function deleteVideoFromContribution(contributionId: string, videoId: string) {
    return authFetch(`/api/contributions/${contributionId}/videos/${videoId}/`, {
      method: 'DELETE',
    });
}

export async function addNoteToContribution(contributionId: string, data: { title: string; note_file: string; }) {
  return authFetch(`/api/contributions/${contributionId}/notes/`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function updateNoteInContribution(contributionId: string, noteId: string, data: { title: string, note_file: string }) {
  return authFetch(`/api/contributions/${contributionId}/notes/${noteId}/`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function deleteNoteFromContribution(contributionId: string, noteId: string) {
    return authFetch(`/api/contributions/${contributionId}/notes/${noteId}/`, {
      method: 'DELETE',
    });
}

export async function sendContactMessage(data: { name: string; email: string; subject: string; message: string; }) {
    const response = await fetch(`${API_BASE_URL}/api/contact/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
        throw new Error(errorData.detail || 'Failed to send message.');
    }

    return response.json();
}

export async function postRating(contributionId: string, rating: number) {
  return authFetch(`/api/contributions/${contributionId}/rate/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rating: rating,
    }),
  });
}

export async function postComment(contributionId: string, comment: string) {
  return authFetch(`/api/contributions/${contributionId}/comments/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: comment,
    }),
  });
}

export async function updateComment(contributionId: string, commentId: string, comment: string) {
    return authFetch(`/api/contributions/${contributionId}/comments/${commentId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: comment }),
    });
}

export async function deleteComment(contributionId: string, commentId: string) {
    return authFetch(`/api/contributions/${contributionId}/comments/${commentId}/`, {
        method: 'DELETE',
    });
}

