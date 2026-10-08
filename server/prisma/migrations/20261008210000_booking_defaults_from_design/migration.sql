-- Booking options default to the redesign's wording (design-demo/calm-elegant/site/book.html).
ALTER TABLE "BookingSettings" ALTER COLUMN "timeSlots" SET DEFAULT E'10:00 am\n11:00 am\n2:00 pm\n4:00 pm\n6:00 pm\n7:00 pm',
ALTER COLUMN "sessionDurations" SET DEFAULT E'20-min intro (Free)\n60-min session (Standard)',
ALTER COLUMN "introText" SET DEFAULT 'Your first 20 minutes are free, with no obligation to continue. Choose what suits you and Tania will confirm on WhatsApp.';
