const validIdRegex = new RegExp(/^[\w\d]{4,20}$/);

export function ValidateEncounterId(id: string) {
  return validIdRegex.test(id);
}