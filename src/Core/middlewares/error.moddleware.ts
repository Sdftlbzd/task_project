interface ErrorItem {
    property: string;
    constraints?: { [key: string]: string };
  }
  
  export function formatErrors(errors: ErrorItem[]): { error: { [key: string]: string }[] } {
    return {
        error: errors.map((item) => ({
            [item.property]: item.constraints? Object.values(item.constraints).join(', '): '',
        })),
    };
  }