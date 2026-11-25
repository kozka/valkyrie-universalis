// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/HTTPManager.cs
// Partial: Get, with DataDownloader. Sending the request is the host's (HTTPManager.send, the browser's fetch); without
// one, every request ends as Valkyrie's network error. GetImage is the app's <img>. Upload, which only publishes
// statistics, posts the form through the host too (HTTPManager.post).
import { ValkyrieDebug } from './ValkyrieTools/ValkyrieDebug.ts';

/** What the host got back: the text, an HTTP error (UnityWebRequest's error text and code), or null when nothing came. */
export type HTTPReply = { text: string } | { status: number; error: string } | null;

/**
 * HTTPManager is a simplified class to download/upload text files.
 * Multiple files can be downloaded at the same time.
 */
// Valkyrie: HTTPManager.cs HTTPManager
export class HTTPManager {
  /** Not in Valkyrie: how the host sends a GET, or null when it has no network (unit tests, the battery). */
  static send: ((url: string) => Promise<HTTPReply>) | null = null;
  /** Not in Valkyrie: how the host posts a form, or null when it has no network. */
  static post: ((url: string, fields: [string, string][]) => Promise<HTTPReply>) | null = null;

  /**
   * Download a text file, and call action() when done, with the content in a string or the error in case of problem,
   * and a bool that is true when there was an error.
   */
  // Valkyrie: HTTPManager.cs HTTPManager.Get, with DataDownloader.DownloadAsync and GetData
  static get(url: string, action: (data: string, error: boolean, uri: string) => void): void {
    const uri = url;
    const send = HTTPManager.send;
    const reply = send === null ? Promise.resolve(null) : send(uri).catch((): HTTPReply => null);
    void reply.then((www_get) => {
      if (www_get === null) {
        // Most probably a connection error
        ValkyrieDebug.log('Error downloading data : most probably a connectivity issue (please check your internet connection)');
        action('ERROR NETWORK', true, uri);
      } else if ('status' in www_get) {
        // Most probably a connection error
        ValkyrieDebug.log('Error downloading data : HTTP error ' + www_get.status + ' most probably a connection error (server error)');
        action(www_get.error + ' ' + www_get.status, true, uri);
      } else {
        // download OK
        action(www_get.text, false, uri);
      }
    });
  }

  /** Upload a form, and call action() when done with the reply and a bool that is true when there was an error. */
  // Valkyrie: HTTPManager.cs HTTPManager.Upload, with DataUploader.PostFormAsync and PostForm
  static upload(url: string, content: [string, string][], action: (data: string, error: boolean) => void): void {
    const post = HTTPManager.post;
    const reply = post === null ? Promise.resolve(null) : post(url, content).catch((): HTTPReply => null);
    void reply.then((www_post) => {
      if (www_post === null) {
        // Most probably a connection error
        action('ERROR NETWORK', true);
        ValkyrieDebug.log('Error uploading data : most probably a connectivity issue (please check your internet connection)');
      } else if ('status' in www_post) {
        // Most probably a connection error
        action(www_post.error + ' ' + www_post.status, true);
        ValkyrieDebug.log('Error uploading data : most probably a connection error (server error)');
      } else {
        // download OK
        action(www_post.text, false);
      }
    });
  }
}
