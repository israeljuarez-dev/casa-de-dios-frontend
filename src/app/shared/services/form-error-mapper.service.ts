import { Service } from '@angular/core';
import { ApiErrorResponse } from '@core/types/api-response.types';

const CHILD_FIELD_REGEX = /^children\[(\d+)\]\.(\w+)$/;

@Service()
export class FormErrorMapperService {

  mapErrors(httpError: unknown, fieldLabelMap: Record<string, string>): Record<string, string> {
    const apiError = (httpError as { error: ApiErrorResponse }).error;
    const mapped: Record<string, string> = {};

    if (apiError?.reasons?.length) {
      for (const reason of apiError.reasons) {
        const dashIndex = reason.indexOf(' - ');
        if (dashIndex === -1) {
          mapped['general'] = reason;
          continue;
        }

        const field = reason.substring(0, dashIndex).trim();
        const message = reason.substring(dashIndex + 3).trim();

        // Detectar errores de hijos: "children[0].firstName"
        const childMatch = CHILD_FIELD_REGEX.exec(field);
        if (childMatch) {
          const index = childMatch[1];   // "0", "1", etc.
          const childField = childMatch[2]; // "firstName", "lastName", etc.
          // Clave compuesta: "child.0.firstName"
          mapped[`child.${index}.${childField}`] = message;
          continue;
        }

        // Campo simple
        const label = fieldLabelMap[field];
        mapped[field] = label
          ? message.replace(new RegExp(field, 'gi'), label)
          : message;
      }
    } else if (apiError?.message) {
      mapped['general'] = apiError.message;
    }

    return mapped;
  }
}