export const generateBill = (rx: any, medicinesFromDB: any[] = []) => {

  let total = 0;

  const normalize = (str: string) =>
    str?.toLowerCase().replace(/\s+/g, '').trim();

  const items = rx.medicines.map((med: any) => {

    const dbMed = medicinesFromDB.find(
      (m: any) =>
        normalize(m.name) === normalize(med.name)
    );

    const price = Number(dbMed?.price ?? 0);

    total += price;

    return {
      name: med.name,
      dosage: med.dosage,
      duration: med.duration,
      price
    };
  });

  const doctorFee = 500;
  total += doctorFee;

  return {
    patient: rx.patient?.name,
    doctor: rx.doctor?.name,
    items,
    doctorFee,
    total
  };
};