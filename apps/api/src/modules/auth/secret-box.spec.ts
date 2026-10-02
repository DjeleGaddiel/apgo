import { SecretBox } from './secret-box';

describe('SecretBox', () => {
  const box = new SecretBox(Buffer.alloc(32, 7).toString('base64'));

  it('retrouve le texte chiffré', () => {
    const sealed = box.encrypt('JBSWY3DPEHPK3PXP');
    expect(sealed).toMatch(/^v1:/);
    expect(sealed).not.toContain('JBSWY3DPEHPK3PXP');
    expect(box.decrypt(sealed)).toBe('JBSWY3DPEHPK3PXP');
  });

  it('produit un chiffré différent à chaque fois', () => {
    expect(box.encrypt('secret')).not.toBe(box.encrypt('secret'));
  });

  it('refuse un chiffré modifié', () => {
    const sealed = box.encrypt('secret');
    const tampered =
      sealed.slice(0, -4) + (sealed.endsWith('AAAA') ? 'BBBB' : 'AAAA');
    expect(() => box.decrypt(tampered)).toThrow();
  });

  it('refuse une autre clé', () => {
    const other = new SecretBox(Buffer.alloc(32, 8).toString('base64'));
    expect(() => other.decrypt(box.encrypt('secret'))).toThrow();
  });
});
