import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VaultState } from '../../../../services/vault.state';

@Component({
  selector: 'app-folder-tree',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './folder-tree.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FolderTree {
  state = inject(VaultState);

  folders = this.state.folders;
  selectedFolderId = this.state.selectedFolderId;
  showNewFolder = signal(false);
  newFolderName = signal('');
  renamingFolderId = signal<string | null>(null);
  renamingValue = signal('');

  selectFolder(id: string | null): void {
    this.state.selectedFolderId.set(id);
  }

  async createFolder(): Promise<void> {
    const name = this.newFolderName().trim();
    if (!name) return;

    await this.state.createFolder(name);
    this.newFolderName.set('');
    this.showNewFolder.set(false);
  }

  async deleteFolder(id: string, event: Event): Promise<void> {
    event.stopPropagation();
    await this.state.deleteFolder(id);
  }

  startRename(id: string, currentName: string, event: Event): void {
    event.stopPropagation();
    this.renamingFolderId.set(id);
    this.renamingValue.set(currentName);
  }

  async confirmRename(id: string): Promise<void> {
    const name = this.renamingValue().trim();
    if (name) {
      await this.state.updateFolder(id, name);
    }
    this.renamingFolderId.set(null);
  }

  cancelRename(): void {
    this.renamingFolderId.set(null);
  }
}
