
using Daycare.Api.Data;
using Daycare.Api.Features.Children.Queries;
using Daycare.Api.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Features.Children.Handlers;

public class GetChildByIdQueryHandler
    : IRequestHandler<GetChildByIdQuery, Child?>
{
    private readonly DaycareDbContext _context;

    public GetChildByIdQueryHandler(DaycareDbContext context)
    {
        _context = context;
    }

    public async Task<Child?> Handle(
        GetChildByIdQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.Children
            .FirstOrDefaultAsync(
                child => child.Id == request.Id,
                cancellationToken);
    }
}
