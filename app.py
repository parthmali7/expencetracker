from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import calendar
from sqlalchemy import extract, func

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expenses.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ──────────────── Models ────────────────

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    icon = db.Column(db.String(10), default='💰')
    color = db.Column(db.String(20), default='#6366f1')
    budget = db.Column(db.Float, default=0)
    expenses = db.relationship('Expense', backref='category_rel', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'color': self.color,
            'budget': self.budget
        }

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today)
    note = db.Column(db.String(300), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'amount': self.amount,
            'category_id': self.category_id,
            'category': self.category_rel.name,
            'category_icon': self.category_rel.icon,
            'category_color': self.category_rel.color,
            'date': self.date.isoformat(),
            'note': self.note,
            'created_at': self.created_at.isoformat()
        }

# ──────────────── Routes ────────────────

@app.route('/')
def index():
    return render_template('index.html')

# ── Expenses ──

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    month = request.args.get('month', date.today().month, type=int)
    year = request.args.get('year', date.today().year, type=int)
    category_id = request.args.get('category_id', type=int)

    q = Expense.query.filter(
        extract('month', Expense.date) == month,
        extract('year', Expense.date) == year
    )
    if category_id:
        q = q.filter(Expense.category_id == category_id)

    expenses = q.order_by(Expense.date.desc(), Expense.created_at.desc()).all()
    return jsonify([e.to_dict() for e in expenses])

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.json
    exp = Expense(
        title=data['title'],
        amount=float(data['amount']),
        category_id=int(data['category_id']),
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        note=data.get('note', '')
    )
    db.session.add(exp)
    db.session.commit()
    return jsonify(exp.to_dict()), 201

@app.route('/api/expenses/<int:eid>', methods=['PUT'])
def update_expense(eid):
    exp = Expense.query.get_or_404(eid)
    data = request.json
    exp.title = data.get('title', exp.title)
    exp.amount = float(data.get('amount', exp.amount))
    exp.category_id = int(data.get('category_id', exp.category_id))
    exp.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    exp.note = data.get('note', exp.note)
    db.session.commit()
    return jsonify(exp.to_dict())

@app.route('/api/expenses/<int:eid>', methods=['DELETE'])
def delete_expense(eid):
    exp = Expense.query.get_or_404(eid)
    db.session.delete(exp)
    db.session.commit()
    return jsonify({'deleted': True})

# ── Categories ──

@app.route('/api/categories', methods=['GET'])
def get_categories():
    cats = Category.query.all()
    return jsonify([c.to_dict() for c in cats])

@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.json
    cat = Category(name=data['name'], icon=data.get('icon','💰'), color=data.get('color','#6366f1'), budget=float(data.get('budget',0)))
    db.session.add(cat)
    db.session.commit()
    return jsonify(cat.to_dict()), 201

@app.route('/api/categories/<int:cid>', methods=['PUT'])
def update_category(cid):
    cat = Category.query.get_or_404(cid)
    data = request.json
    cat.name = data.get('name', cat.name)
    cat.icon = data.get('icon', cat.icon)
    cat.color = data.get('color', cat.color)
    cat.budget = float(data.get('budget', cat.budget))
    db.session.commit()
    return jsonify(cat.to_dict())

@app.route('/api/categories/<int:cid>', methods=['DELETE'])
def delete_category(cid):
    cat = Category.query.get_or_404(cid)
    db.session.delete(cat)
    db.session.commit()
    return jsonify({'deleted': True})

# ── Analytics ──

@app.route('/api/analytics/summary')
def summary():
    month = request.args.get('month', date.today().month, type=int)
    year = request.args.get('year', date.today().year, type=int)

    rows = db.session.query(
        Category.id, Category.name, Category.icon, Category.color, Category.budget,
        func.sum(Expense.amount).label('total')
    ).join(Expense).filter(
        extract('month', Expense.date) == month,
        extract('year', Expense.date) == year
    ).group_by(Category.id).all()

    total_spent = sum(r.total for r in rows)

    cats = []
    for r in rows:
        cats.append({
            'id': r.id, 'name': r.name, 'icon': r.icon,
            'color': r.color, 'budget': r.budget,
            'total': round(r.total, 2),
            'pct': round(r.total / total_spent * 100, 1) if total_spent else 0
        })
    cats.sort(key=lambda x: x['total'], reverse=True)

    return jsonify({'total': round(total_spent, 2), 'categories': cats})

@app.route('/api/analytics/daily')
def daily():
    month = request.args.get('month', date.today().month, type=int)
    year = request.args.get('year', date.today().year, type=int)

    rows = db.session.query(
        Expense.date, func.sum(Expense.amount).label('total')
    ).filter(
        extract('month', Expense.date) == month,
        extract('year', Expense.date) == year
    ).group_by(Expense.date).order_by(Expense.date).all()

    num_days = calendar.monthrange(year, month)[1]
    day_map = {r.date.day: round(r.total, 2) for r in rows}
    data = [{'day': d, 'total': day_map.get(d, 0)} for d in range(1, num_days+1)]

    return jsonify(data)

@app.route('/api/analytics/trend')
def trend():
    year = request.args.get('year', date.today().year, type=int)

    rows = db.session.query(
        extract('month', Expense.date).label('month'),
        func.sum(Expense.amount).label('total')
    ).filter(extract('year', Expense.date) == year
    ).group_by('month').order_by('month').all()

    month_map = {int(r.month): round(r.total, 2) for r in rows}
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    data = [{'month': months[i], 'total': month_map.get(i+1, 0)} for i in range(12)]
    return jsonify(data)

# ──────────────── Seed ────────────────

def seed():
    if Category.query.count() == 0:
        defaults = [
            ('Food & Dining', '🍔', '#f97316', 8000),
            ('Transport', '🚗', '#3b82f6', 3000),
            ('Shopping', '🛍️', '#ec4899', 5000),
            ('Entertainment', '🎬', '#8b5cf6', 2000),
            ('Health', '💊', '#10b981', 2000),
            ('Utilities', '💡', '#f59e0b', 3000),
            ('Education', '📚', '#6366f1', 2000),
            ('Other', '📦', '#64748b', 2000),
        ]
        for name, icon, color, budget in defaults:
            db.session.add(Category(name=name, icon=icon, color=color, budget=budget))
        db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed()
    app.run(debug=True, port=5000)
