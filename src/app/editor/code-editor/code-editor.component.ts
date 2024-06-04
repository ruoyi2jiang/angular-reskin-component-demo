import { Component, computed, EventEmitter, OnInit, Output } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { editor } from 'monaco-editor';
import IDiffEditor = editor.IDiffEditor;
import IModelContentChangedEvent = editor.IModelContentChangedEvent;
import IModelContentChange = editor.IModelContentChange;
import { CssService } from '../service/css.service';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [MonacoEditorModule],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss',
})
export class CodeEditorComponent implements OnInit {
  @Output()
  loaded = new EventEmitter();

  originalCodeModel = computed(() => {
    return {
      language: 'css',
      code: this.cssService.originalCssCode(),
    };
  });

  modifiedCodeModel = computed(() => {
    return {
      language: 'css',
      code: this.cssService.modifiedCssCode(),
    };
  });

  options = {
    theme: 'vs-light',
    contextmenu: true,
    automaticLayout: true,
    glyphMargin: true,
    minimap: {
      enabled: false,
    },
  };

  constructor(private cssService: CssService) {}

  ngOnInit() {
    this.loaded.emit();
    this.cssService.updateModifiedCode();
  }

  onInitDiffEditor(diffEditor: IDiffEditor) {
    if (!diffEditor) {
      return;
    }

    // This only emit the latest change
    // get the changed variables
    diffEditor.getModifiedEditor().onDidChangeModelContent((e: IModelContentChangedEvent) => {
      const code = diffEditor.getModel()?.modified.getValue();
      const modifiedLines = code?.split('\n');
      const changedLines: string[] = e.changes.reduce((acc: string[], curr: IModelContentChange) => {
        const getLines = modifiedLines?.filter(
          (line, index) => index < curr.range.endLineNumber && index >= curr.range.startLineNumber - 1
        );
        if (getLines) {
          acc.push(...getLines);
        }
        return acc;
      }, []);

      this.cssService.updateCustomStylesFromCode(changedLines);
    });
  }
}
