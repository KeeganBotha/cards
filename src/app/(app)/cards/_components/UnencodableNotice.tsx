// SPEC rule 8: should be unreachable given validation, but the encoder is the
// last line. Show mode keeps the number itself selectable underneath.
export function UnencodableNotice() {
  return (
    <p className="text-center text-sm text-muted-foreground">
      This number can&apos;t be drawn as a barcode. Show the cashier the number
      below instead.
    </p>
  );
}
