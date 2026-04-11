const data = Could not open input file: artisan;
try {
    const mapped = data.data.map(e => ({
        id: String(e.event_id),
        name: e.title,
        date: String(e.start_time).split(' ')[0],
        price: 1500
    }));
    console.log(mapped);
} catch (e) {
    console.error(e.message);
}
