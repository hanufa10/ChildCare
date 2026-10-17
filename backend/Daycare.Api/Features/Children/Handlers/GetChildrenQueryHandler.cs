using Daycare.Api.Data;
using Daycare.Api.Features.Children.Queries;
using Daycare.Api.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Features.Children.Handlers;

public class GetChildrenQueryHandler
    : IRequestHandler<GetChildrenQuery, List<Child>>
{
    private readonly DaycareDbContext _context;

    public GetChildrenQueryHandler(DaycareDbContext context)
    {
        _context = context;
    }

    public async Task<List<Child>> Handle(
        GetChildrenQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.Children
            .ToListAsync(cancellationToken);
    }
}