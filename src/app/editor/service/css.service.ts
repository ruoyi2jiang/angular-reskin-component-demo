import { Injectable, SecurityContext, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

export interface ConfigItem {
  type: string;
  group: string;
  name: string;
  value: string;
  variableName: string;
  isChanged: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CssService {
  cssConfigItemsMap = signal<Record<string, ConfigItem>>({});
  originalCssCode = signal<string>('');
  modifiedCssCode = signal<string>('');

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    this.getVariablesCSS();
  }

  getVariablesCSS(): void {
    this.getCssFile('default')
      .pipe(take(1))
      .subscribe(css => {
        const variables = this.getCSSConfigItems(css);
        this.cssConfigItemsMap.set(variables);
        const formattedCss = this.exportCssVariablesAsCssString();
        this.originalCssCode.set(formattedCss);
        this.modifiedCssCode.set(formattedCss);
      });
  }

  /**
   * Apply updated css variables
   * @param variableName
   * @param value
   */
  updateCustomStyles(variableName: string, value: string) {
    this.cssConfigItemsMap()[variableName].value = value;
    this.cssConfigItemsMap()[variableName].isChanged = true;

    const css = this.exportCssVariablesAsCssString(true);
    this.applyCustomStyleChange(css);
  }

  updateCustomStylesFromCode(changedLines: string[]) {
    changedLines.forEach(line => {
      const variable = line
        .trim()
        .replace(/(--|;)/g, '')
        .split(':');
      this.cssConfigItemsMap()[variable[0]].value = variable[1].trim();
      this.cssConfigItemsMap()[variable[0]].isChanged = true;
    });
    const css = this.exportCssVariablesAsCssString(true);
    this.applyCustomStyleChange(css);
  }

  updateModifiedCode() {
    this.modifiedCssCode.set(this.exportCssVariablesAsCssString());
  }

  downloadUpdatedThemeFile() {
    const data = this.exportCssVariablesAsCssString(true);
    const blob = new Blob([data], {
      type: 'application/octet-stream',
    });
    const fileUrl = this.sanitizer.sanitize(
      SecurityContext.RESOURCE_URL,
      this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob))
    );
    const link = document.createElement('a');
    link.setAttribute('download', 'default');
    link.setAttribute('href', fileUrl ?? '*');
    link.setAttribute('target', '_blank');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
  }

  private exportCssVariablesAsCssString(changedOnly = false, minimize = false): string {
    const linebreak = minimize ? '' : '\n';
    const separator = `;${linebreak}`;
    let items = Object.values(this.cssConfigItemsMap());
    if (changedOnly) {
      items = items.filter(i => i.isChanged);
    }
    const css = items.map(i => `--${i.variableName}:${i.value}`).join(separator);
    return `:root{${linebreak}${css}${separator}}`;
  }


  /**
   * Create a dom element style sheet for custom variables
   * @param css
   * @private
   */
  private applyCustomStyleChange(css: string) {
    const head = document.getElementsByTagName('head')[0];
    let element = document.getElementById('custom-style') as HTMLStyleElement;

    if (!element) {
      element = document.createElement('style');
      element.id = 'custom-style';
      element.innerHTML = css;
      head.appendChild(element);
    } else {
      element.innerHTML = css;
    }
  }


  private getCSSConfigItems(css: string): Record<string, ConfigItem> {
    const variables = RegExp(/{([^}]+)}/g).exec(css);
    if (!variables) {
      return {};
    }
    return variables[1]
      .split(/;/)
      .map(x => x.trim())
      .filter(line => line.startsWith('--'))
      .reduce((acc: Record<string, ConfigItem>, line) => {
        const variable = this.parseVariable(line);
        acc[variable.variableName] = variable;
        return acc;
      }, {});
  }

  private parseVariable(line: string): ConfigItem {
    const [group, name] = line
      .split(':')[0]
      .replace('--', '')
      .replace(/-/g, ' ')
      .split('_')
      .map(s => s.trim());
    const split = line.split(':');
    const type = this.checkInputType(split[1].trim());

    return {
      type,
      group,
      name,
      value: split[1].trim(),
      variableName: split[0].trim().replace('--', ''),
      isChanged: false,
    };
  }

  private checkInputType(value: string) {
    if (value.startsWith('#')) {
      return 'color';
    } else if (!isNaN(parseInt(value))) {
      return 'range';
    }
    return 'text';
  }

  private getCssFile(fileName: string) {
    return this.http.get(`/themes/${fileName}.scss`, { responseType: 'text' });
  }
}
